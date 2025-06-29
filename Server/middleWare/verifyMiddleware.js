import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import connectToDatabase from "../DbConnection/Db.js";

dotenv.config();

const verifyToken = async (req, res, next) => {
  try {
    // Extract the token from Authorization header
    const token = req.headers.authorization || req.headers.AUTHORIZATION;

    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_TOKEN);

    req.userId = decoded.id;
    req.userEmail = decoded.email;

    const db = await connectToDatabase();

    // Ensure role_id is correctly retrieved
    const [findRole] = await db.query("SELECT role FROM mst_roles WHERE id = ?", [
      decoded.role
    ]);

    // console.log("Find Role Query Result:", findRole);  // Debugging line

    if (!findRole || findRole.length === 0) {
      return res.status(401).json({ message: "Unauthorized", error: "Role not found" });
    }

    req.userRole = findRole[0].role; // Correctly access the role
    

    // console.log("User Role: ", req.userRole); 
    // console.log("User ID: ", req.userId);
    // console.log("User Email: ", req.userEmail );

    next();

  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized", error: error.message });
  }
};


export default verifyToken;
