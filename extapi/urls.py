# coding=utf-8
from django.conf.urls import url
from .views import ActionQueryView, GetResultView, GetLastQueryes


urlpatterns = [
    url(r'^$', ActionQueryView.as_view()),
    url(r'^last/$', GetLastQueryes.as_view()),
    url(r'^(?P<token>.*)$', GetResultView.as_view()),
]