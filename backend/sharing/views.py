import tempfile

from rest_framework.views import (
    APIView
)

from rest_framework.response import (
    Response
)

from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated
)

from rest_framework.parsers import (
    MultiPartParser
)

from rest_framework import generics

from rest_framework.exceptions import (
    PermissionDenied
)

from albums.models import Album

from images.models import Image

from recognition.models import (
    DetectedFace
)

from recognition.services.matching_service import (
    match_face
)

from .models import ShareLink

from .serializers import (
    ShareLinkSerializer
)


class CreateShareLinkView(
    generics.CreateAPIView
):

    serializer_class = (
        ShareLinkSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]

    def perform_create(
        self,
        serializer
    ):

        album_id = self.kwargs[
            "album_id"
        ]

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


class MatchFaceView(APIView):

    permission_classes = [
        AllowAny
    ]

    parser_classes = [
        MultiPartParser
    ]

    def post(
        self,
        request,
        token
    ):

        try:

            share_link = (
                ShareLink.objects.get(
                    token=token
                )
            )

        except ShareLink.DoesNotExist:

            return Response({

                "error":
                "Invalid link"

            }, status=404)

        selfie = request.FILES.get(
            "selfie"
        )

        if not selfie:

            return Response({

                "error":
                "Selfie required"

            }, status=400)

        # TEMP SELFIE FILE
        with tempfile.NamedTemporaryFile(

            delete=False,

            suffix=".jpg"

        ) as temp_file:

            for chunk in selfie.chunks():

                temp_file.write(chunk)

            temp_path = temp_file.name

        matches = match_face(

            temp_path,

            share_link.album
        )

        results = []

        for item in matches:

            try:

                image_id = item[
                    "image_id"
                ]

                face_id = item[
                    "face_id"
                ]

                confidence = item[
                    "confidence"
                ]

                image = Image.objects.get(
                    id=image_id
                )

                matched_face = (
                    DetectedFace.objects.get(
                        id=face_id
                    )
                )

                results.append({

                    "id":
                    image.id,

                    "image":
                    image.image.url,

                    "matched_face":
                    matched_face.face_image.url,

                    "confidence":
                    confidence
                })

            except Exception as e:

                print(
                    "[RESULT ERROR]:",
                    e
                )

        return Response(results)