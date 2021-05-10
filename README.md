# CBSTSimulation
**Server Setup Instruction**

Please follow the instructions below to setup the server for hosting the Flask Application with Apache(mod\_wsgi) on centos 7.

Step 1: Install Python and necessary package

- To Setup flask either create a virtual environment or install in root. Use requirement.txt provided with this package and run command given below to install all necessary package for this flask application.

**pip install -r requirements.txt**

- Run a basic (helloworld) flask app to check if flask is working properly or not.

Step 2: Install Mysql in centos 7

- Mariadb comes by default in centos 7. Follow the instruction given in link below to install and setup MySQL in centos 7.

https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-centos-7

Step 3:  Database Migration

- Run python script in &quot;utilities&quot; folder of Module to setup DB for Celebrity cruise simulation tool.
- If the migration is complete without any errors proceed to deploying the application.

Step 4: Install and setup redis. Celebrity cruise simulation tool is using redis as server side session management system (Optional for other flask applications).

- Run following commands to setup redis

sudo yum install epel-release

sudo yum update

sudo yum install redis

sudo systemctl start redis

sudo systemctl enable redis

- Verify that Redis is running with redis-cli

redis-cli ping

it will return

PONG

Step 5: Install Apache, Mod\_wsgi

- Install these Packages from the CentOS and EPEL Repos. Run commands given below

sudo yum install epel-release

sudo yum install httpd mod\_wsgi

- enable Apache as a CentOS service so that it will automatically start after a reboot

sudo systemctl enable httpd.service

- Test to make sure Apache is running successfully. Go to your browser type public IP of your machine in url you will see similar page as shown below.

![alt text] (https://i1.wp.com/linuxtechlab.com/wp-content/uploads/2017/02/Apache-test.jpg)

Step 6: Creating a .wsgi file

- To run your application you need a &quot;yourapplication.wsgi&quot; file. This file contains the code mod\_wsgi is executing on startup to get the application object. The object called application in that file is then used as application.
- Place it in the root directory of your application.
- Follow link given below for more details

[http://flask.pocoo.org/docs/0.12/deploying/mod\_wsgi/](http://flask.pocoo.org/docs/0.12/deploying/mod_wsgi/)

Step 7: Move application to folder /var/www/html/&lt;yourapplication&gt;

Step 8: Configuring Apache

- The last thing you have to do is to create an Apache configuration file for your application.

Listen &lt;PORT NUMBER&gt;

Include conf.modules.d/\*.conf

LoadModule wsgi\_module modules/mod\_wsgi.so

IncludeOptional conf.d/\*.conf





Create a your application.conf file containing following lines(Modify these for your application accordingly):

&lt;VirtualHost \*&gt;

        # The ServerName directive sets the request scheme, hostname and port that

        # the server uses to identify itself. This is used when creating

        # redirection URLs. In the context of virtual hosts, the ServerName

        # specifies what hostname must appear in the request&#39;s Host: header to

        # match this virtual host. For the default virtual host (this file) this

        # value is not decisive as it is used as a last resort host regardless.

        # However, you must set it for any further virtual host explicitly.

        ServerName 52.204.113.39

        ServerAdmin webmaster@localhost

        DocumentRoot /var/www/html/CBST

        WSGIDaemonProcess CBST threads=5

        WSGIScriptAlias /cbst /var/www/html/CBST/cbst.wsgi

        &lt;Directory /var/www/html/CBST&gt;

                WSGIProcessGroup CBST

                WSGIApplicationGroup %{GLOBAL}

                Order allow,deny

                Allow from all

                #Require all granted

        &lt;/Directory&gt;

        # Available loglevels: trace8, ..., trace1, debug, info, notice, warn,

        # error, crit, alert, emerg.

        # It is also possible to configure the loglevel for particular

        # modules, e.g.

        #LogLevel info ssl:warn

        #ErrorLog ${APACHE\_LOG\_DIR}/error.log

        #CustomLog ${APACHE\_LOG\_DIR}/access.log combined

        # For most configuration files from conf-available/, which are



Place this &lt;yourapplication&gt;.conf file in /etc/httpd/conf or /etc/httpd/conf.d

Now restart Apache server using following command.

sudo systemctl restart httpd
