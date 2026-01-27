import axios from "axios";

function Upload({ setData }) {
  const handleUpload = async (e) => {
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    const res = await axios.post(
      "http://127.0.0.1:8000/api/upload/",
      formData
    );

    setData(res.data); // pass data to App
  };

  return <input type="file" onChange={handleUpload} />;
}

export default Upload;
