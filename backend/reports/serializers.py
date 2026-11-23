from rest_framework import serializers
from .models import ItemReport

class ItemReportSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    owner = serializers.IntegerField(source="owner_id", read_only=True)

    class Meta:
        model = ItemReport
        fields = [
            "id",
            "owner",
            "title",
            "item_type",
            "category",
            "description",
            "location",
            "event_date",
            "contact_email",
            "image",
            "status",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "owner",
            "status",
            "created_at",
        ]

