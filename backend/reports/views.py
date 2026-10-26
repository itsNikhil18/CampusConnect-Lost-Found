from django.db.models import Q
from rest_framework import generics, permissions, parsers, serializers
from rest_framework.exceptions import PermissionDenied

from .models import ItemReport
from .serializers import ItemReportSerializer

class ItemReportListCreateView(generics.ListCreateAPIView):
    serializer_class = ItemReportSerializer
    queryset = ItemReport.objects.all()

    parser_classes = [
        parsers.JSONParser,
        parsers.FormParser,
        parsers.MultiPartParser,
    ]

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = super().get_queryset()

        # Show only the logged-in user's reports when requested.
        mine = self.request.query_params.get("mine")
        if mine == "true":
            if not self.request.user.is_authenticated:
                return ItemReport.objects.none()
            queryset = queryset.filter(owner=self.request.user)

        item_type = self.request.query_params.get("type")
        search = self.request.query_params.get("search")
        status = self.request.query_params.get("status")

        if item_type in {"lost", "found"}:
            queryset = queryset.filter(item_type=item_type)

        if status in {"open", "claimed", "resolved"}:
            queryset = queryset.filter(status=status)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(location__icontains=search)
                | Q(category__icontains=search)
            )

        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ItemReportDetailView(generics.RetrieveUpdateAPIView):
    queryset = ItemReport.objects.all()
    serializer_class = ItemReportSerializer

    parser_classes = [
        parsers.JSONParser,
        parsers.FormParser,
        parsers.MultiPartParser,
    ]

    def get_permissions(self):
        if self.request.method in {"PUT", "PATCH"}:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_update(self, serializer):
        report = self.get_object()

        if report.owner_id != self.request.user.id:
            raise PermissionDenied(
                "You can only update reports that you submitted."
            )

        # Keep ownership unchanged when editing a report.
        serializer.save(owner=report.owner)
class ItemReportStatusUpdateView(generics.UpdateAPIView):
    serializer_class = ItemReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["patch", "options", "head"]

    def get_queryset(self):
        return ItemReport.objects.filter(owner=self.request.user)

    def patch(self, request, *args, **kwargs):
        from rest_framework.response import Response
        from rest_framework import status

        report = self.get_object()
        new_status = request.data.get("status")

        if new_status not in {"open", "claimed", "resolved"}:
            return Response(
                {"status": "Choose open, claimed, or resolved."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report.status = new_status
        report.save(update_fields=["status"])

        return Response(
            ItemReportSerializer(
                report,
                context={"request": request},
            ).data,
            status=status.HTTP_200_OK,
        )

