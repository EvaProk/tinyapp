# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). 
This application is really useful for internet users . In a few clicks you can shorten the URL. If you accidently made any mistakes you can edit your URL in a few seconds. Tiny App is easy to use and super user friendly. Tiny App will not allow anyone else to see your URL list. For user convenience there are Edit and Delete buttons, which allow you to keep your URL list organized.

And last but not least, your password will stay safe as we use encrypted cookies and hash passwords. 

## Final Product

!["Login Page"](https://github.com/EvaProk/tinyapp/blob/feature/user-registration/docs/Login-page.png%20.png)

!["Create URL page"](https://github.com/EvaProk/tinyapp/blob/feature/user-registration/docs/create-url.png)

!["Create URL page"](https://github.com/EvaProk/tinyapp/blob/feature/user-registration/docs/create-url.png)

!["/urls page"](https://github.com/EvaProk/tinyapp/blob/feature/user-registration/docs/urls-page.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- Mocha and Chai

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- You can test TinyApp at `http://localhost:8080/`.
- Once you're on the main page TinyApp will suggest you to Login or Register.
- As you complete the registration you are ready to start creating your short URLs
- At the `http://localhost:8080/urls/new` page create shorten URL
- Once created, you will be redirected to ` http://localhost:8080/urls/:shortURL` . Where you can Edit your Long URL or , if you press on the short URL, you will be redirecter to the original Long URL website.
- On `http://localhost:8080/urls` all short Urls created by a user are stored. On this page Urls can be edited and Deleted.
- The user can finish the session by clicking LOGOUT


## How to run Unit Tests 

- Run `npm test` to start Unit Tests 
