import uuid

from io import BytesIO

from PIL import (
    Image as PILImage,
    ImageFile
)

from django.core.files.base import (
    ContentFile
)

from deepface import DeepFace

from recognition.models import (
    DetectedFace,
    FaceEmbedding
)

# HUGE IMAGE PROTECTION FIX
PILImage.MAX_IMAGE_PIXELS = None

ImageFile.LOAD_TRUNCATED_IMAGES = True


def process_image_faces(image_instance):

    image_path = image_instance.image.path

    try:

        # OPEN IMAGE
        original = PILImage.open(
            image_path
        ).convert("RGB")

        # AUTO RESIZE HUGE IMAGES
        MAX_SIZE = (1920, 1920)

        original.thumbnail(MAX_SIZE)

        # SAVE OPTIMIZED IMAGE
        original.save(
            image_path,
            quality=85,
            optimize=True
        )

        # DETECT FACES
        detections = DeepFace.extract_faces(
            img_path=image_path,
            detector_backend='retinaface',
            enforce_detection=False
        )

        # DELETE OLD FACES
        DetectedFace.objects.filter(
            image=image_instance
        ).delete()

        count = 0

        for face_data in detections:

            facial_area = face_data[
                'facial_area'
            ]

            x = facial_area['x']
            y = facial_area['y']
            w = facial_area['w']
            h = facial_area['h']

            # IGNORE TINY FACES
            if w < 80 or h < 80:
                continue

            # CROP FACE
            cropped = original.crop(
                (x, y, x + w, y + h)
            )

            # FACE QUALITY RESIZE
            cropped.thumbnail(
                (600, 600)
            )

            # TEMP BUFFER
            buffer = BytesIO()

            cropped.save(
                buffer,
                format='JPEG',
                quality=90
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
                ContentFile(buffer.getvalue()),
                save=True
            )

            # GENERATE EMBEDDING
            embedding_data = (
                DeepFace.represent(
                    img_path=detected_face.face_image.path,
                    model_name='ArcFace',
                    detector_backend='skip',
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

        print(f"Processed {count} faces")

        return count

    except Exception as e:

        print(
            "Face Processing Error:",
            e
        )

        image_instance.face_count = 0

        image_instance.save()

        return 0