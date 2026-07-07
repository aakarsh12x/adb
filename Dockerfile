# set base image (host OS)
FROM python:3.8

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN apt-get -y update
RUN apt-get install -y curl nano wget nginx git

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list


# Mongo
# fetch libssl1.1 from buster (dropped in bookworm but needed by mongo 4.4)
RUN wget -q http://archive.debian.org/debian/pool/main/o/openssl/libssl1.1_1.1.1n-0+deb10u3_amd64.deb \
    && dpkg -i libssl1.1_1.1.1n-0+deb10u3_amd64.deb \
    && rm libssl1.1_1.1.1n-0+deb10u3_amd64.deb
RUN ln -s /bin/echo /bin/systemctl
RUN wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add -
RUN echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/4.4 main" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list
RUN apt-get -y update
RUN apt-get install -y mongodb-org

# react-scripts 4 needs Node 16 (fails on 17+ due to postcss exports)
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs

# Install Yarn
RUN apt-get install -y yarn

# pin pip below 24.1 to avoid celery metadata validation failure
RUN pip install "pip<24.1"


ENV ENV_TYPE staging
ENV MONGO_HOST mongo
ENV MONGO_PORT 27017
##########

ENV PYTHONPATH=$PYTHONPATH:/src/

# copy the dependencies file to the working directory
COPY src/requirements.txt .

# install dependencies
RUN pip install -r requirements.txt
