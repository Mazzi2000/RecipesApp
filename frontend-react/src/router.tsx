import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { RecipesPage } from '@/features/recipes/pages/RecipesPage';
import { RecipeDetailPage } from '@/features/recipes/pages/RecipeDetailPage';
import { FavoritesPage } from '@/features/favorites/pages/FavoritesPage';
import { PlannerPage } from '@/features/planner/pages/PlannerPage';
import { NotFoundPage } from '@/components/common/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <RecipesPage /> },
      { path: 'recipes', element: <Navigate to="/" replace /> },
      { path: 'recipes/:id', element: <RecipeDetailPage /> },
      {
        path: 'favorites',
        element: (
          <RequireAuth>
            <FavoritesPage />
          </RequireAuth>
        ),
      },
      {
        path: 'planner',
        element: (
          <RequireAuth>
            <PlannerPage />
          </RequireAuth>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
