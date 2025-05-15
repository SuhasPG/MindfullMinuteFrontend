import { Routes } from '@angular/router';
import { LoginComponent } from './Pages/login/login.component';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';
import { LayoutComponent } from './Pages/layout/layout.component';
import { JournalComponent } from './Pages/journal/journal.component';
import { RegisterComponent } from './Pages/register/register.component';
import { ExerciseListComponent } from './Pages/exercises/exercise-list/exercise-list.component';
import { ExerciseComponent } from './Pages/exercises/exercise/exercise.component';
import { NotfoundComponent } from './Pages/notfound/notfound.component';
export const routes: Routes = [
    {
        path:'login',
        component: LoginComponent
    },
    {
        path:'register',
        component: RegisterComponent
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    
    {
        path: '', 
        component: LayoutComponent,
        children: [
            {
                path: 'dashboard',
                component: DashboardComponent,
            },
            {
                path: 'exercise',
                component: ExerciseListComponent
            },
            {
                path: 'exercise/:id',
                component: ExerciseComponent
            },
            {
                path: 'journal',
                component: JournalComponent
            },
        ]
    },
    {
        path: '404',
        component: NotfoundComponent,
    },
    { path: '**', redirectTo: 'PageNotFound' }
];
