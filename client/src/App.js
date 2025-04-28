import Editor from "./Editor";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={`/documents/${uuidV4()}`} />}
        />
        <Route
          path="/documents/:id"
          element={<Editor />}
        />
      </Routes>
    </Router>
  );
}

export default App;

