import HomeView from "../views/home-view"
import AboutView from "../views/about-view"
import AddStoryView from "../views/add-story-view"
import LoginView from "../views/login-view"
import RegisterView from "../views/register-view"
import NotFoundView from "../views/not-found-view"
import SavedStoriesView from "../views/saved-stories-view"

const routes = {
  "/": new HomeView(),
  "/about": new AboutView(),
  "/add-story": new AddStoryView(),
  "/login": new LoginView(),
  "/register": new RegisterView(),
  "/saved-stories": new SavedStoriesView(),
  "/404": new NotFoundView(),
}

export default routes
