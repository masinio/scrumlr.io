import { HashRouter, Route, Redirect, Switch } from 'react-router-dom';

import LoginBoard from './LoginBoard/LoginBoard';
import NewBoard from './NewBoard/NewBoard';
import BoardGuard from './Board/BoardGuard';
import PrivateRoute from './PrivateRoute';

const Router = () => (
    <HashRouter>
        <Switch>
            <Redirect exact from="/" to="/new" /> 
            <Route path="/new" component={NewBoard as any} />
            <Route path="/login" component={LoginBoard as any} />
            <PrivateRoute path="/board/:id" component={BoardGuard as any}/>
        </Switch>
    </HashRouter>
);

export default Router;