from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from .utils import analyze_csv
from .models import Dataset
from .utils import generate_pdf_report
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
charts_dir = os.path.join(BASE_DIR, "desktop_reports", "charts")




class UploadCSV(APIView):
    def post(self, request):
        file = request.FILES['file']
        summary = analyze_csv(file)

        Dataset.objects.create(
            filename=file.name,
            summary=summary
        )

        # Keep only last 5
        old_ids = (
            Dataset.objects
            .order_by('-uploaded_at')
            .values_list('id', flat=True)[5:]
        )

        Dataset.objects.filter(id__in=list(old_ids)).delete()
        generate_pdf_report(summary)
        return Response(summary)

class HistoryAPIView(APIView):
    def get(self, request):
        datasets = Dataset.objects.order_by('-uploaded_at')[:5]

        data = [
            {
                "filename": d.filename,
                "summary": d.summary,
                "uploaded_at": d.uploaded_at
            }
            for d in datasets
        ]

        return Response(data)

        


