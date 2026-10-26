from django.db import models
from django.contrib.auth.models import User

class ItemReport(models.Model):
    ITEM_TYPES = [
        ("lost", "Lost"),
        ("found", "Found"),
    ]

    STATUS_CHOICES = [
        ("open", "Open"),
        ("claimed", "Claimed"),
        ("resolved", "Resolved"),
    ]

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="item_reports",
        null=True,
        blank=True,
    )

    title = models.CharField(max_length=120)
    item_type = models.CharField(max_length=10, choices=ITEM_TYPES)
    category = models.CharField(max_length=60, default="Other")
    description = models.TextField()
    location = models.CharField(max_length=120)
    event_date = models.DateField()
    contact_email = models.EmailField()

    image = models.ImageField(
        upload_to="item_photos/",
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="open",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_item_type_display()}: {self.title}"
