from django.db import models

from albums.models import Album


class Image(models.Model):

    album = models.ForeignKey(
        Album,
        on_delete=models.CASCADE,
        related_name='images'
    )

    image = models.ImageField(
        upload_to='albums/'
    )

    face_count = models.IntegerField(
        default=0
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Image {self.id}"