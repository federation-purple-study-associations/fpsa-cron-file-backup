FROM node:lts-alpine3.9
WORKDIR /mnt

ADD script.js ./
ADD package.json ./

RUN npm i

CMD zip -r ${PATH} "$(date +%F).zip"  && node script
