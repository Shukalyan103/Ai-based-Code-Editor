import { create } from "zustand";

export const editStore = create((set) => ({
  message:[],

  addMessage:(role,content)=>
    set((state)=>({
      message:[
        ...state.message,
        {
          role,
          content
        },
       
      ]
    }

    )),
  }))
//   files: {
//     "App.js": {
//       content:
//         `function hello(){
//  console.log("Hello");
// }`
//     },


//   },

//   activeFile: "App.js",


//   // addFile: (fileName, content) =>
//   //   set((state) => ({
//   //     files: {
//   //       ...state.files,              // keep all existing files
//   //       [fileName]: {                // add new file
//   //         content: content
//   //       }
//   //     }
//   //   })),
//   addFile: (fileName, content) => {
//     set((state) => ({
//       files: {
//         ...state.files,
//         [fileName]: {
//           content: content
//         }
//       }
//     })


//     )
//   },
      

//   setActiveFile: (file) =>
//     set({ activeFile: file }),

//   updateCode: (code) =>
//     set((state) => ({
//       files: {
//         ...state.files,
//         [state.activeFile]: {
//           ...state.files[state.activeFile],
//           content: code
//         }
//       }
//     }))
