from django.urls import path
from .views import (
    ItemReportDetailView,
    ItemReportListCreateView,
    ItemReportStatusUpdateView,
)

urlpatterns = [
    path("reports/", ItemReportListCreateView.as_view(), name="report-list-create"),
    path(
        "reports/<int:pk>/status/",
        ItemReportStatusUpdateView.as_view(),
        name="report-status-update",
    ),
    path("reports/<int:pk>/", ItemReportDetailView.as_view(), name="report-detail"),
]