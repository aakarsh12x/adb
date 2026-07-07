from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging
import os

from pymongo import MongoClient
from pymongo.errors import PyMongoError

logger = logging.getLogger(__name__)

mongo_uri = 'mongodb://' + os.environ["MONGO_HOST"] + ':' + os.environ["MONGO_PORT"]
db = MongoClient(mongo_uri)['test_db']


def serialize_todo(doc):
    # mongo _id isn't JSON serializable by default
    doc['id'] = str(doc.pop('_id'))
    return doc


def fetch_all_todos():
    cursor = db['todos'].find()
    return [serialize_todo(doc) for doc in cursor]


def insert_todo(description):
    result = db['todos'].insert_one({'description': description})
    return str(result.inserted_id)


class TodoListView(APIView):

    def get(self, request):
        try:
            todos = fetch_all_todos()
            return Response({'todos': todos}, status=status.HTTP_200_OK)
        except PyMongoError as e:
            logger.error('mongo read failed: %s', e)
            return Response(
                {'error': 'could not fetch todos'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request):
        description = (request.data or {}).get('description', '').strip()

        if not description:
            return Response(
                {'error': 'description is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            inserted_id = insert_todo(description)
            return Response(
                {'id': inserted_id, 'description': description},
                status=status.HTTP_201_CREATED,
            )
        except PyMongoError as e:
            logger.error('mongo write failed: %s', e)
            return Response(
                {'error': 'could not save todo'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
