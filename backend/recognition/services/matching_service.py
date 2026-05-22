import tempfile

from PIL import Image

from deepface import DeepFace

from scipy.spatial.distance import cosine

from recognition.models import (
    FaceEmbedding
)

# STRICTER THRESHOLDS
DISTANCE_THRESHOLD = 0.59

MIN_CONFIDENCE = 38


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

        # TAKE LARGEST FACE ONLY
        largest_face = max(

            detections,

            key=lambda face:
            face['facial_area']['w']
            *
            face['facial_area']['h']
        )

        facial_area = largest_face[
            'facial_area'
        ]

        x = facial_area['x']
        y = facial_area['y']
        w = facial_area['w']
        h = facial_area['h']

        # IGNORE SMALL/BLURRY FACE
        if w < 60 or h < 60:

            print("FACE TOO SMALL")

            return []

        # OPEN SELFIE
        original = Image.open(
            selfie_path
        ).convert("RGB")

        # CROP FACE
        cropped = original.crop(
            (x, y, x + w, y + h)
        )

        # IMPROVE MATCH QUALITY
        cropped = cropped.resize(
            (320, 320)
        )

        # SAVE TEMP FACE
        with tempfile.NamedTemporaryFile(

            delete=False,

            suffix=".jpg"

        ) as temp_face:

            cropped.save(

                temp_face.name,

                format="JPEG",

                quality=95
            )

            temp_face_path = (
                temp_face.name
            )

        # SELFIE EMBEDDING
        selfie_data = DeepFace.represent(

            img_path=temp_face_path,

            model_name='ArcFace',

            detector_backend='skip',

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

            try:

                stored_embedding = (
                    item.embedding
                )

                distance = cosine(

                    selfie_embedding,

                    stored_embedding
                )

                confidence = round(
                    (1 - distance) * 100,
                    2
                )

                print(

                    "IMAGE:",

                    item.face.image.id,

                    "DISTANCE:",

                    distance,

                    "CONFIDENCE:",

                    confidence
                )

                # STRICT FILTER
                if (
                    distance < DISTANCE_THRESHOLD
                    and
                    confidence > MIN_CONFIDENCE
                ):

                    current = image_scores.get(
                        item.face.image.id
                    )

                    # KEEP BEST MATCH
                    if (

                        current is None

                        or

                        confidence >
                        current['confidence']
                    ):

                        image_scores[
                            item.face.image.id
                        ] = {

                            "face_id":
                            item.face.id,

                            "confidence":
                            confidence
                        }

            except Exception as inner_error:

                print(
                    "EMBEDDING ERROR:",
                    inner_error
                )

                continue

        # SORT BEST FIRST
        sorted_matches = sorted(

            image_scores.items(),

            key=lambda x:
            x[1]['confidence'],

            reverse=True
        )

        results = []

        # RETURN ONLY STRONG MATCHES
        for image_id, data in (
            sorted_matches
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