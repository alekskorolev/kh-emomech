# coding=utf-8 #
from django import http
from django.views.generic import View


class ActionQueryView(View):
    def get(self, request, *args, **kwargs):
        return http.JsonResponse({"token": "fake_queue_token"})


class GetResultView(View):
    def get(self, request, *args, **kwargs):
        return http.JsonResponse({"messages": []})