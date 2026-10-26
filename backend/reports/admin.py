from django.contrib import admin
from .models import ItemReport

@admin.register(ItemReport)
class ItemReportAdmin(admin.ModelAdmin):
    list_display = ("title", "item_type", "category", "location", "status", "created_at")
    list_filter = ("item_type", "category", "status")
    search_fields = ("title", "description", "location", "contact_email")
