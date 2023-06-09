# devconnector

Social network for developers (MERN stack = MongoDB + Express + React + Node.js). Redux is used for a state management.

Live demo is [here](https://agile-depths-75605.herokuapp.com/).

## Functionality

-   Sign up and sign in
    -   Publicly available:
        -   List of all registered developers
        -   Profiles of each developer
    -   Privately available:
        -   Personal dashboard (experiences and education)
        -   Edit profile view
        -   Adding experience view
        -   Adding education view
        -   Deleting an account
        -   Posts
            -   Possibility to add and delete post
            -   Possibility to like and dislike post
            -   Possibility to comment/discuss post

## Development

1. change default.json file in config folder
2. `npm install` - to install server dependencies
3. `cd client && npm install` - to install client dependencies
4. `npm run dev` - runs backend and frontend with hotreload functionality

Based on [udemy course](https://www.udemy.com/mern-stack-front-to-back/)
