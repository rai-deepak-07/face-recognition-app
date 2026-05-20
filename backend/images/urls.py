from django.urls import path

from .views import (
    ImageUploadView,
    AlbumImagesView,
    ImageDeleteView
)

urlpatterns = [

    path(
        '<int:album_id>/upload/',
        ImageUploadView.as_view()
    ),

    path(
        '<int:album_id>/',  
        AlbumImagesView.as_view()
    ),
    
    path(
        'delete/<int:pk>/',
        ImageDeleteView.as_view()
    ),
]