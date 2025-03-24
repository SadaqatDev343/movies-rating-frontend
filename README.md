Movie Rating Frontend (Next.js)

Description:
This project is the frontend for the Movie Rating API, built with Next.js. It communicates with the backend API to fetch, display, and manage movie ratings. Below are the instructions to set up and run the frontend project on your local machine.

Prerequisites:
Before running the project, make sure you have the following installed:
- Node.js (v12 or higher)
- npm (comes with Node.js)
- Next.js (npm install will install dependencies)

Installation Steps:
1. Clone the repository
First, clone the repository to your local machine:
    git clone https://github.com/yourusername/movie-rating-frontend.git
    cd movie-rating-frontend

2. Install Dependencies
Open a terminal and navigate to the movie-rating-frontend directory. Run the following command to install the necessary dependencies:
    npm install

3. Set Up Environment Variables
Create a `.env.local` file in the root of the project and add the following environment variable:

    NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

This will ensure that the frontend communicates with the backend API running at `http://localhost:3000`.

4. Change the Default Port to 4002
To run the application on port **4002**, create a `next.config.js` file in the root of your project (if it doesn't exist), and add the following configuration:

