from django.urls import path
from .views import UploadCSV
from .views import UploadCSV, HistoryAPIView

urlpatterns = [
    path('upload/', UploadCSV.as_view()),
    path('history/', HistoryAPIView.as_view())
]
