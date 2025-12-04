import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import "../../style/login.scss"; // Stealing login styling for consistency

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [working, setWorking] = useState(true);
    const [ready, setReady] = useState(false);
    const navigate = useNavigate(); //  To send user back to login

    //Get session from supabase URL
    useEffect(() => {
        (async () => {
            const {data, error} = await supabase.auth.getSession();
            setWorking(false);
            setReady(!error && Boolean(data.session));
        })();
    }, []); //  Runs on page load/mount

    const submit = async(e:React.FormEvent) => {    
        e.preventDefault(); // Page doesn't reload upon submit
        if(password !== confirm) return alert(`Passwords don't match`);

        const {error} = await supabase.auth.updateUser({password}); //  Tries to update password
        if(error) return alert(error.message);  //  Password update failed

        alert(`Pwassword updated`);
        navigate("/login");
    };

    if(working) { // validating Session
        return (
            <div className="login-page">
                <div className="login-card">
                    <p>Loading...</p>
                </div>
            </div>
    );
  }

    if(!ready) {
        return(
            <div className="login-page">
                <div className="login-card">
                    <h2>Invalid or Expired Link</h2>
                    <p className="small-text">
                        Please request a new password reset link.
                    </p>
                    <button
                        className="back-btn"
                        onClick={() => navigate("/forgot-password")}
                    >
                        Back to Forgot Password
                    </button>
                </div>
            </div>
        );
    }

    return(
        <div className="login-page">
            <div className="login-card">
                <h2>Reset Password</h2>
                <p className="small-text">Enter and confirm new password</p>

                <form onSubmit={submit}>
                    <label>New Password</label>
                    <input
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                    />

                    <button type="submit" className="login-btn" disabled={/*Add this eventually*/ false}>
                        Submit    
                    </button>
                </form>

                <div className="divider">OR</div>

                <button className="back-btn" onClick={() => navigate("/login")}>
                    Back to Login
                </button>
            </div>
        </div>
    );
  
}