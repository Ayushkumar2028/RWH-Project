from django.urls import path
from .views import health_check, create_assessment, assessment_detail, regenerate_pdf

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('create/', create_assessment, name='create_assessment'),
    path('<int:pk>/', assessment_detail, name='assessment_detail'),
    path('<int:pk>/regenerate-pdf/', regenerate_pdf, name='regenerate_pdf'),
]