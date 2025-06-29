function extractFirstName(email) {  // Extract email to name 
  return email.split("@")[0].split(".")[0];
}

export default extractFirstName;
