import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { ConfigProvider } from 'antd'; // Tích hợp sẵn chuẩn bị cho Theme

function App() {
    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#1677ff' } }}>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </ConfigProvider>
    );
}

export default App;