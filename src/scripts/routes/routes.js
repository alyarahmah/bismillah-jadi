import HomeView from "../views/home-view"
import AboutView from "../views/about-view"
import AddStoryView from "../views/add-story-view"
import LoginView from "../views/login-view"
import RegisterView from "../views/register-view"
import NotFoundView from "../views/not-found-view"
import OfflineStoriesView from "../views/offline-stories-view"

const routes = {
  "/": new HomeView(),
  "/about": new AboutView(),
  "/add-story": new AddStoryView(),
  "/login": new LoginView(),
  "/register": new RegisterView(),
  "/offline-stories": new OfflineStoriesView(),
  "/404": new NotFoundView(),
}

export default routes
