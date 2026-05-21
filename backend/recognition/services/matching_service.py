import tempfile

from PIL import Image

from deepface import DeepFace

from scipy.spatial.distance import cosine

from recognition.models import (
    FaceEmbedding
)


DISTANCE_THRESHOLD = 0.75


def match_face(selfie_path, album):

    try:

        print("MATCH STARTED")

        # DETECT SELFIE FACE
        detections = DeepFace.extract_faces(

            img_path=selfie_path,

            detector_backend='retinaface',

            enforce_detection=True
        )

        if not detections:

            print("NO FACE DETECTED")

            return []

        face = detections[0]

        facial_area = face['facial_area']

        x = facial_area['x']
        y = facial_area['y']
        w = facial_area['w']
        h = facial_area['h']

        # OPEN SELFIE IMAGE
        original = Image.open(
            selfie_path
        ).convert("RGB")

        # CROP FACE
        cropped = original.crop(
            (x, y, x + w, y + h)
        )

        # SAVE TEMP CROPPED FACE
        with tempfile.NamedTemporaryFile(

            delete=False,

            suffix=".jpg"

        ) as temp_face:

            cropped.save(
                temp_face.name,
                format="JPEG"
            )

            temp_face_path = (
                temp_face.name
            )

        # GENERATE SELFIE EMBEDDING
        selfie_data = DeepFace.represent(

            img_path=temp_face_path,

            model_name='ArcFace',

            enforce_detection=False
        )

        selfie_embedding = selfie_data[0][
            'embedding'
        ]

        image_scores = {}

        embeddings = FaceEmbedding.objects.filter(
            face__image__album=album
        )

        for item in embeddings:

            stored_embedding = item.embedding

            distance = cosine(

                selfie_embedding,

                stored_embedding
            )

            print(
                "IMAGE:",
                item.face.image.id,
                "DISTANCE:",
                distance
            )

            # LOWER DISTANCE = BETTER
            if distance < DISTANCE_THRESHOLD:

                confidence = round(
                    (1 - distance) * 100,
                    2
                )

                current = image_scores.get(
                    item.face.image.id
                )

                # KEEP BEST MATCH ONLY
                if (
                    current is None
                    or confidence > current['confidence']
                ):

                    image_scores[
                        item.face.image.id
                    ] = {

                        "face_id":
                        item.face.id,

                        "confidence":
                        confidence
                    }

        # SORT BEST MATCHES
        sorted_matches = sorted(

            image_scores.items(),

            key=lambda x: x[1][
                'confidence'
            ],

            reverse=True
        )

        results = []

        # TOP 3 BEST MATCHES
        for image_id, data in (
            sorted_matches[:]
        ):

            results.append({

                "image_id":
                image_id,

                "face_id":
                data['face_id'],

                "confidence":
                data['confidence']
            })

        print(
            "FINAL MATCHES:",
            results
        )

        return results

    except Exception as e:

        print(
            "Matching Error:",
            e
        )

        return []