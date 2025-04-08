export interface SidebarLink {
  key:  string ; 
  label: string;
  icon: JSX.Element;
  href:string;
  children?: LevelKeysProps[];
  popupClassName?:string;
}