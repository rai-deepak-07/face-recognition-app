from rest_framework import serializers

from .models import ShareLink


class ShareLinkSerializer(serializers.ModelSerializer):

    class Meta:

        model = ShareLink

        fields = '__all__'

        read_only_fields = [
            'album',
            'token'
        ]