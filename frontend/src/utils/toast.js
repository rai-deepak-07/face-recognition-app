import toast from "react-hot-toast";


export const successToast = (message) => {
  toast.success(message);
};


export const errorToast = (message) => {
  toast.error(message);
};


export const loadingToast = (message) => {
  return toast.loading(message);
};


export const dismissToast = (id) => {
  toast.dismiss(id);
};


export const promiseToast = ( promise, messages) => {

  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },

    {
      loading: { duration: Infinity, },
      success: { duration: 3000, },
      error: { duration: 4000, },
    }
  );
};