import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navigation';
import Home from './components/Home';
import ImageToPDFConverter from './components/ImageToPdfConverter'; // your component
import Footer from './components/Footer';
import PdfToImageConverter from './components/PdfToImageConverter';
import ImageGenerator from './components/ImageGenerator'

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/image-to-pdf" element={<ImageToPDFConverter />} />
        <Route path='/pdf-to-image' element={<PdfToImageConverter/>}></Route>
        <Route path='/image-generator' element={<ImageGenerator></ImageGenerator>}></Route>
      </Routes>
      <Footer></Footer>
    </Router>
  );
}
