from rest_framework import serializers
from .models import Assessment

class AssessmentSerializer(serializers.ModelSerializer):
    pdf_report_url = serializers.SerializerMethodField()

    class Meta:
        model = Assessment
        fields = '__all__'

    def get_pdf_report_url(self, obj):
        if obj.pdf_report:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.pdf_report.url)
            return obj.pdf_report.url
        return None