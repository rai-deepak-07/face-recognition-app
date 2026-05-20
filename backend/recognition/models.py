from django.db import models

from images.models import Image


class DetectedFace(models.Model):

    image = models.ForeignKey(

        Image,

        on_delete=models.CASCADE,

        related_name='faces'
    )

    face_image = models.ImageField(
        upload_to='faces/'
    )

    x = models.IntegerField()

    y = models.IntegerField()

    width = models.IntegerField()

    height = models.IntegerField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return f"Face {self.id}"


class FaceEmbedding(models.Model):

    face = models.ForeignKey(

        DetectedFace,

        on_delete=models.CASCADE,

        related_name='embeddings'
    )

    embedding = models.JSONField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return f"Embedding {self.id}"