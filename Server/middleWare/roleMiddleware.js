const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        
        // console.log("User Role:", req.userRole);
        // console.log("Allowed Roles:", roles);

      if (!req.userRole) {
        return res.status(403).json({ message: "Forbidden: No role assigned" });
      }
  
      if (!roles.includes(req.userRole)) {
        return res.status(403).json({ message: "Forbidden: You do not have permission" });
      }
  
      next();
    };
  };
  
  export default authorizeRoles;
  