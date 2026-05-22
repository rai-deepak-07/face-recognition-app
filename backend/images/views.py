import threading

from rest_framework.views import (
    APIView
)

from rest_framework.permissions import (
    IsAuthenticated
)

from rest_framework.response import (
    Response
)

from rest_framework import (
    status,
    generics
)

from rest_framework.exceptions import (
    PermissionDenied
)

from albums.models import Album

from .models import Image

from .serializers import ImageSerializer

from recognition.services.face_service import (
    process_image_faces
)


class ImageUploadView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(
        self,
        request,
        album_id
    ):

        try:

            album = Album.objects.get(

                id=album_id,

                user=request.user
            )

        except Album.DoesNotExist:

            raise PermissionDenied(
                "Album not found"
            )

        files = request.FILES.getlist(
            "images"
        )

        if not files:

            return Response({

                "error":
                "No images selected"

            }, status=400)

        # MAX 10 IMAGES
        if len(files) > 10:

            return Response({
                "error":
                "Maximum 10 images allowed"
            }, status=400)

        uploaded_images = []

        for file in files:

            image = Image.objects.create(
                album=album,
                image=file
            )

            # BACKGROUND THREAD
            threading.Thread(
                target=process_image_faces,
                args=(image,),
                daemon=True
            ).start()

            uploaded_images.append({

                "id":
                image.id,

                "image":
                image.image.url,

                "status":
                "processing"
            })

        return Response(

            uploaded_images,

            status=status.HTTP_201_CREATED
        )


class AlbumImagesView(
    generics.ListAPIView
):

    serializer_class = (
        ImageSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        album_id = self.kwargs[
            "album_id"
        ]

        return Image.objects.filter(

            album__id=album_id,

            album__user=self.request.user

        ).order_by("-id")


class ImageDeleteView(
    generics.DestroyAPIView
):

    serializer_class = (
        ImageSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Image.objects.filter(
            album__user=self.request.user
        )