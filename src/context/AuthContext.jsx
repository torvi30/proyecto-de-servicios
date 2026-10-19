import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../firebase";
import {
  getBusinessByOwnerId,
  saveBusinessProfile,
  getLocalItem,
  verifyUserIsSuperAdmin,
} from "../services/firestoreService";

const AuthContext = createContext(null);

const DEMO_USER = {
  uid: "demo-user-1",
  email: "profesional@electrovolt.com",
  displayName: "Víctor Electricista",
  photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userRole, setUserRole] = useState("service_admin"); // 'superadmin' | 'service_admin'
  const [business, setBusiness] = useState(() => {
    // Inicializar de inmediato con el negocio activo guardado en local
    try {
      const local = getLocalItem("business", null);
      if (local) return local;
    } catch (_) {
      // Ignorar
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  // Verificar y actualizar rol de super admin
  const checkRole = async (usr) => {
    if (!usr) {
      setIsSuperAdmin(false);
      setUserRole("service_admin");
      return false;
    }
    const isSA = await verifyUserIsSuperAdmin(usr);
    setIsSuperAdmin(isSA);
    setUserRole(isSA ? "superadmin" : "service_admin");
    if (!isSA) {
      localStorage.removeItem("vitrinapro_superadmin_mode");
    }
    return isSA;
  };

  // Cargar o sincronizar el negocio asociado al usuario
  const refreshBusiness = async (userId) => {
    try {
      const isSuperAdminMode = localStorage.getItem("vitrinapro_superadmin_mode") === "true";
      const localBiz = getLocalItem("business", null);
      if (isSuperAdminMode && localBiz) {
        setBusiness(localBiz);
        return localBiz;
      }

      const biz = await getBusinessByOwnerId(userId);
      if (biz) {
        // Si hay modificaciones locales recientes de este mismo negocio, preservarlas
        if (localBiz && (localBiz.id === biz.id || localBiz.businessSlug === biz.businessSlug)) {
          const merged = { ...biz, ...localBiz };
          setBusiness(merged);
          return merged;
        }
        setBusiness(biz);
        return biz;
      } else if (localBiz && userId === "demo-user-1") {
        setBusiness(localBiz);
        return localBiz;
      }
      return null;
    } catch (err) {
      console.error("Error refreshing business:", err);
      return null;
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          await checkRole(currentUser);
          const isSuperAdminMode = localStorage.getItem("vitrinapro_superadmin_mode") === "true";
          const localBiz = getLocalItem("business", null);
          if (isSuperAdminMode) {
            if (localBiz) {
              setBusiness(localBiz);
            } else {
              await refreshBusiness(currentUser.uid);
            }
          } else {
            if (localBiz && localBiz.ownerId === currentUser.uid) {
              setBusiness(localBiz);
            }
            await refreshBusiness(currentUser.uid);
          }
          setIsDemoUser(false);
        } else {
          // Si no hay usuario logueado en Firebase pero queremos permitir probar en modo demo
          const isSuperAdminMode = localStorage.getItem("vitrinapro_superadmin_mode") === "true";
          if (isSuperAdminMode) {
            const impersonated = getLocalItem("business", null);
            if (impersonated) {
              setBusiness(impersonated);
            }
          } else {
            const savedDemo = localStorage.getItem("vitrinapro_demo_active");
            if (savedDemo === "true") {
              setUser(DEMO_USER);
              setIsDemoUser(true);
              await checkRole(DEMO_USER);
              await refreshBusiness(DEMO_USER.uid);
            } else {
              setUser(null);
              setBusiness(null);
              setIsSuperAdmin(false);
              setUserRole("service_admin");
            }
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Sin configuración Firebase: iniciar en modo Demostración listo para usar
      setUser(DEMO_USER);
      setIsDemoUser(true);
      checkRole(DEMO_USER).then(() => {
        refreshBusiness(DEMO_USER.uid).then(() => setLoading(false));
      });
    }

    const handleBusinessSwitched = (e) => {
      if (e.detail) {
        setBusiness(e.detail);
      }
    };
    window.addEventListener("vitrinapro_business_switched", handleBusinessSwitched);
    return () => {
      window.removeEventListener("vitrinapro_business_switched", handleBusinessSwitched);
    };
  }, []);


  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      loginAsDemo();
      return;
    }
    const result = await signInWithPopup(auth, googleProvider);
    setUser(result.user);
    setIsDemoUser(false);
    let biz = await refreshBusiness(result.user.uid);
    if (!biz) {
      // Crear negocio inicial si es primer login
      const newBiz = {
        id: `biz-${result.user.uid.substring(0, 8)}`,
        ownerId: result.user.uid,
        businessName: result.user.displayName || "Mi Negocio de Servicios",
        businessSlug: (result.user.displayName || "servicio")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-"),
        category: "general",
        whatsappNumber: "573000000000",
        logoUrl: result.user.photoURL || "",
      };
      biz = await saveBusinessProfile(newBiz);
      setBusiness(biz);
    }
    return result.user;
  };

  const loginWithEmail = async (email, password) => {
    if (!isFirebaseConfigured) {
      loginAsDemo();
      return;
    }
    const result = await signInWithEmailAndPassword(auth, email, password);
    setUser(result.user);
    setIsDemoUser(false);
    await refreshBusiness(result.user.uid);
    return result.user;
  };

  const registerWithEmail = async (email, password, displayName) => {
    if (!isFirebaseConfigured) {
      loginAsDemo();
      return;
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    setUser(result.user);
    setIsDemoUser(false);
    // Registrar negocio inicial
    const newBiz = {
      id: `biz-${result.user.uid.substring(0, 8)}`,
      ownerId: result.user.uid,
      businessName: displayName || "Mi Negocio",
      businessSlug: (displayName || "mi-negocio")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-"),
      category: "servicios",
      whatsappNumber: "573000000000",
      logoUrl: "",
    };
    const saved = await saveBusinessProfile(newBiz);
    setBusiness(saved);
    return result.user;
  };

  const loginAsDemo = async () => {
    localStorage.setItem("vitrinapro_demo_active", "true");
    setUser(DEMO_USER);
    setIsDemoUser(true);
    await refreshBusiness(DEMO_USER.uid);
  };

  const logout = async () => {
    localStorage.removeItem("vitrinapro_demo_active");
    localStorage.removeItem("vitrinapro_superadmin_mode");
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setUser(null);
    setBusiness(null);
    setIsSuperAdmin(false);
    setUserRole("service_admin");
    setIsDemoUser(false);
  };

  const updateBusinessState = async (updatedFields) => {
    if (!business) return;
    const merged = { ...business, ...updatedFields };
    const saved = await saveBusinessProfile(merged);
    setBusiness(saved);
    return saved;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        loading,
        isDemoUser,
        isSuperAdmin,
        userRole,
        checkRole,
        isFirebaseConfigured,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAsDemo,
        logout,
        updateBusinessState,
        refreshBusiness,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
}
