import uuid

from io import BytesIO

from PIL import Image as PILImage

from django.core.files.base import (
    ContentFile
)

from deepface import DeepFace

from recognition.models import (
    DetectedFace,
    FaceEmbedding
)


def process_image_faces(image_instance):

    image_path = image_instance.image.path

    try:

        # DETECT FACES
        detections = DeepFace.extract_faces(

            img_path=image_path,

            detector_backend='retinaface',

            enforce_detection=True
        )

        # DELETE OLD FACES
        DetectedFace.objects.filter(
            image=image_instance
        ).delete()

        original = PILImage.open(
            image_path
        ).convert("RGB")

        count = 0

        for face_data in detections:

            facial_area = face_data[
                'facial_area'
            ]

            x = facial_area['x']
            y = facial_area['y']
            w = facial_area['w']
            h = facial_area['h']

            # CROP FACE
            cropped = original.crop(
                (x, y, x + w, y + h)
            )

            # TEMP FACE FILE
            buffer = BytesIO()

            cropped.save(
                buffer,
                format='JPEG'
            )

            temp_name = (
                f"{uuid.uuid4()}.jpg"
            )

            # SAVE FACE
            detected_face = (
                DetectedFace.objects.create(
                    image=image_instance,
                    x=x,
                    y=y,
                    width=w,
                    height=h
                )
            )

            detected_face.face_image.save(

                temp_name,

                ContentFile(
                    buffer.getvalue()
                ),

                save=True
            )

            # GENERATE EMBEDDING
            embedding_data = (
                DeepFace.represent(

                    img_path=detected_face
                    .face_image.path,

                    model_name='ArcFace',

                    enforce_detection=False
                )
            )

            embedding = embedding_data[0][
                'embedding'
            ]

            FaceEmbedding.objects.create(

                face=detected_face,

                embedding=[
                    float(x)
                    for x in embedding
                ]
            )

            count += 1

        image_instance.face_count = count

        image_instance.save()

        return count

    except Exception as e:

        print(
            "Face Processing Error:",
            e
        )

        image_instance.face_count = 0

        image_instance.save()

        return 0