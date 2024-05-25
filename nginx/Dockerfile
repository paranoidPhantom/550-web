FROM nginx
WORKDIR /etc/nginx
COPY ./config /etc/nginx

RUN rm -rf conf.d

CMD ["nginx", "-g", "daemon off;"]