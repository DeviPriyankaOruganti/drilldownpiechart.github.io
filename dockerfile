FROM  mavenqa.got.volvo.net:18443/nginx:1.12.2


#support running as arbitrary user which belogs to the root group
RUN chmod g+rwx /var/cache/nginx /var/run /var/log/nginx


RUN rm /etc/nginx/conf.d/default.conf

COPY dist/ /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/

#RUN chmod g+rwx /usr/share/nginx/html/

USER root

EXPOSE 8080
RUN sed -i.bak 's/^user/#user/' /etc/nginx/nginx.conf
