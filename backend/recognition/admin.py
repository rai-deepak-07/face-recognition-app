from django.contrib import admin

from .models import FaceEmbedding, DetectedFace

admin.site.register(FaceEmbedding)
admin.site.register(DetectedFace)