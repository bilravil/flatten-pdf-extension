async function sendFileToServer(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://localhost:3000/api/flatten", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to flatten PDF");

    const blob = await response.blob();
    const fileURL = URL.createObjectURL(blob);

    return fileURL;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}
