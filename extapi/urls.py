# coding=utf-8
from django.conf.urls import url
from .views import ActionQueryView, GetResultView


urlpatterns = [
    url(r'^$', ActionQueryView.as_view()),
    url(r'^(?P<token>.*)$', GetResultView.as_view()),
]