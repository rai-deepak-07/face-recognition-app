from django.urls import path

from .views import (
    AlbumListCreateView,
    AlbumDeleteView,
)

urlpatterns = [
    path('', AlbumListCreateView.as_view()),
    path('<int:pk>/delete/', AlbumDeleteView.as_view()),
]