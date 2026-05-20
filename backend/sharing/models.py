import uuid

from django.db import models

from albums.models import Album


class ShareLink(models.Model):

    album = models.ForeignKey(
        Album,
        on_delete=models.CASCADE,
        related_name='share_links'
    )

    token = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return str(self.token)