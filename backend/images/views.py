from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from albums.models import Album

from .models import Image
from .serializers import ImageSerializer


class ImageUploadView(generics.CreateAPIView):

    serializer_class = ImageSerializer

    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        album_id = self.kwargs['album_id']

        try:

            album = Album.objects.get(
                id=album_id,
                user=self.request.user
            )

        except Album.DoesNotExist:

            raise PermissionDenied(
                "Album not found"
            )

        serializer.save(album=album)


class AlbumImagesView(generics.ListAPIView):

    serializer_class = ImageSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        album_id = self.kwargs['album_id']

        return Image.objects.filter(
            album__id=album_id,
            album__user=self.request.user
        )
        

class ImageDeleteView(generics.DestroyAPIView):

    serializer_class = ImageSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Image.objects.filter(
            album__user=self.request.user
        )