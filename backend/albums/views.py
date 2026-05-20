from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Album
from .serializers import AlbumSerializer


class AlbumListCreateView(generics.ListCreateAPIView):

    serializer_class = AlbumSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Album.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AlbumDeleteView(generics.DestroyAPIView): 

    serializer_class = AlbumSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Album.objects.filter(user=self.request.user)