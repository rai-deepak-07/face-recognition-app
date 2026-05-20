from django.urls import path

from .views import (
    CreateShareLinkView,
    MatchFaceView
)

urlpatterns = [

    path(
        'create/<int:album_id>/',
        CreateShareLinkView.as_view()
    ),

    path(
        'match/<uuid:token>/',
        MatchFaceView.as_view()
    ),
]