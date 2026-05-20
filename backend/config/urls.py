from django.contrib import admin
from django.urls import path, include

from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/users/', include('users.urls')),
    path('api/albums/', include('albums.urls')),
    path('api/images/', include('images.urls')),
    path('api/sharing/', include('sharing.urls')),
    
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
]

urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)